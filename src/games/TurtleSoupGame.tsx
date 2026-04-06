import { useState } from 'react';
import { Eraser, KeyRound, Lightbulb, RefreshCw, Send, Sparkles } from 'lucide-react';
import { requestGlm } from '../lib/glm';
import type {
  GlmChatMessage,
  TurtleSoupMessage,
  TurtleSoupPuzzle,
  TurtleSoupSessionState,
} from '../types/games';

const API_KEY_STORAGE = 'glm-4.6v-api-key';
const DEFAULT_API_KEY = 'a90d16f35951444db802c9ba9dc844db.qLZirnkm9COi5U3U';

const SYSTEM_PROMPT = `
你是一个全中文的海龟汤主持人。
规则：
1. 一局只围绕一道原创海龟汤进行。
2. 回答玩家普通提问时，只能先给出“是 / 不是 / 无关 / 接近了”之一，再补一小句中文反馈，不超过 30 个字。
3. 玩家要求提示时，给循序渐进提示，不能直接剧透完整真相。
4. 玩家要求揭晓时，必须完整说明【真相】和【复盘】。
5. 不要跳出主持人口吻，不要英文，不要空泛废话。
`.trim();

const INITIAL_SESSION: TurtleSoupSessionState = {
  phase: 'idle',
  isLoading: false,
  error: null,
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: '先填入你的 GLM-4.6V API Key，然后点击“开始新汤”。',
      tag: 'status',
    },
  ],
  puzzle: null,
  usedHints: 0,
};

function safeSessionStorageGet(key: string) {
  if (typeof window === 'undefined') {
    return '';
  }

  return sessionStorage.getItem(key) ?? '';
}

function safeSessionStorageSet(key: string, value: string) {
  if (typeof window === 'undefined') {
    return;
  }

  if (value) {
    sessionStorage.setItem(key, value);
  } else {
    sessionStorage.removeItem(key);
  }
}

function tryParsePuzzle(raw: string): TurtleSoupPuzzle {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error('题目解析失败，请重试一次。');
  }

  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<TurtleSoupPuzzle>;

  if (!parsed.story || !parsed.solution || !Array.isArray(parsed.hints) || parsed.hints.length === 0) {
    throw new Error('题目内容不完整，请重试一次。');
  }

  return {
    story: parsed.story,
    solution: parsed.solution,
    hints: parsed.hints.filter(Boolean).slice(0, 3),
  };
}

function buildHostContext(puzzle: TurtleSoupPuzzle, history: TurtleSoupMessage[]): GlmChatMessage[] {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'system',
      content: `本局题面：${puzzle.story}\n标准答案：${puzzle.solution}\n预设提示：${puzzle.hints.join(' / ')}`,
    },
    ...history
      .filter((message) => message.role !== 'system' && message.tag !== 'status')
      .map((message) => ({
        role: message.role,
        content: message.content,
      })),
  ];
}

function createMessage(role: TurtleSoupMessage['role'], content: string, tag: TurtleSoupMessage['tag']) {
  return {
    id: `${Date.now()}-${Math.random()}`,
    role,
    content,
    tag,
  } satisfies TurtleSoupMessage;
}

export default function TurtleSoupGame() {
  const [apiKey, setApiKey] = useState(() => safeSessionStorageGet(API_KEY_STORAGE) || DEFAULT_API_KEY);
  const [input, setInput] = useState('');
  const [session, setSession] = useState<TurtleSoupSessionState>(INITIAL_SESSION);

  const updateApiKey = (value: string) => {
    setApiKey(value);
    safeSessionStorageSet(API_KEY_STORAGE, value.trim());
  };

  const appendMessages = (messages: TurtleSoupMessage[]) => {
    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, ...messages],
    }));
  };

  const startNewSoup = async () => {
    if (!apiKey.trim()) {
      setSession((prev) => ({
        ...prev,
        phase: 'error',
        error: '还没有 API Key，先输入后再开始。',
      }));
      return;
    }

    setSession({
      ...INITIAL_SESSION,
      isLoading: true,
      messages: [createMessage('assistant', '正在让 GLM-4.6V 出一道新的海龟汤……', 'status')],
    });

    try {
      const raw = await requestGlm(apiKey.trim(), {
        model: 'glm-4.6v',
        temperature: 0.95,
        top_p: 0.85,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content:
              '请创作一道原创海龟汤，并严格返回 JSON：{"story":"题面","solution":"真相","hints":["提示1","提示2","提示3"]}。不要输出 markdown，不要多余说明。',
          },
        ],
      });

      const puzzle = tryParsePuzzle(raw);

      setSession({
        phase: 'playing',
        isLoading: false,
        error: null,
        puzzle,
        usedHints: 0,
        messages: [
          createMessage('assistant', `题面：${puzzle.story}`, 'host'),
          createMessage('assistant', '你可以像主持人面前一样提问，也可以直接提交你的最终猜想。', 'status'),
        ],
      });
    } catch (error) {
      setSession({
        ...INITIAL_SESSION,
        phase: 'error',
        isLoading: false,
        error: error instanceof Error ? error.message : '启动失败，请稍后重试。',
        messages: [createMessage('assistant', '这局没成功开出来，再试一次。', 'status')],
      });
    }
  };

  const askHost = async (mode: 'question' | 'answer') => {
    if (!session.puzzle || !input.trim()) {
      return;
    }

    const userText = input.trim();
    const userMessage = createMessage('user', userText, mode === 'question' ? 'question' : 'answer');

    appendMessages([userMessage]);
    setInput('');
    setSession((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await requestGlm(apiKey.trim(), {
        model: 'glm-4.6v',
        temperature: 0.35,
        top_p: 0.7,
        messages: [
          ...buildHostContext(session.puzzle, [...session.messages, userMessage]),
          {
            role: 'user',
            content:
              mode === 'question'
                ? `玩家提问：${userText}\n请按主持规则作答。`
                : `玩家提交最终答案：${userText}\n如果猜中，请输出“猜中了：”开头，并给出完整【真相】和【复盘】；如果没猜中，请输出“还不对：”开头，并给一个不剧透的简短提示。`,
          },
        ],
      });

      const isSolved = mode === 'answer' && response.startsWith('猜中了');

      setSession((prev) => ({
        ...prev,
        isLoading: false,
        phase: isSolved ? 'revealed' : prev.phase,
        messages: [...prev.messages, createMessage('assistant', response, isSolved ? 'reveal' : 'host')],
      }));
    } catch (error) {
      setSession((prev) => ({
        ...prev,
        isLoading: false,
        phase: 'error',
        error: error instanceof Error ? error.message : '提问失败，请稍后重试。',
      }));
    }
  };

  const getHint = async () => {
    if (!session.puzzle) {
      return;
    }

    setSession((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await requestGlm(apiKey.trim(), {
        model: 'glm-4.6v',
        temperature: 0.45,
        top_p: 0.7,
        messages: [
          ...buildHostContext(session.puzzle, session.messages),
          {
            role: 'user',
            content: `玩家想要第 ${session.usedHints + 1} 条提示。请给不超过 35 字的中文提示，不要直接说出真相。`,
          },
        ],
      });

      setSession((prev) => ({
        ...prev,
        isLoading: false,
        usedHints: prev.usedHints + 1,
        messages: [...prev.messages, createMessage('assistant', response, 'hint')],
      }));
    } catch (error) {
      const fallbackHint = session.puzzle.hints[session.usedHints] ?? '先盯住题面里最不合理的动作。';

      setSession((prev) => ({
        ...prev,
        isLoading: false,
        usedHints: prev.usedHints + 1,
        messages: [...prev.messages, createMessage('assistant', `提示：${fallbackHint}`, 'hint')],
        error: error instanceof Error ? error.message : null,
      }));
    }
  };

  const revealAnswer = async () => {
    if (!session.puzzle) {
      return;
    }

    setSession((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await requestGlm(apiKey.trim(), {
        model: 'glm-4.6v',
        temperature: 0.4,
        top_p: 0.7,
        messages: [
          ...buildHostContext(session.puzzle, session.messages),
          { role: 'user', content: '玩家认输。请完整输出【真相】和【复盘】。' },
        ],
      });

      setSession((prev) => ({
        ...prev,
        phase: 'revealed',
        isLoading: false,
        messages: [...prev.messages, createMessage('assistant', response, 'reveal')],
      }));
    } catch {
      setSession((prev) => ({
        ...prev,
        phase: 'revealed',
        isLoading: false,
        messages: [
          ...prev.messages,
          createMessage(
            'assistant',
            `【真相】${session.puzzle?.solution}\n【复盘】题面里所有看似反常的细节，都是为了把你往错误因果上带。`,
            'reveal',
          ),
        ],
      }));
    }
  };

  return (
    <section className="arcade-game">
      <div className="arcade-game-header">
        <div>
          <p className="arcade-game-kicker">AI 主持</p>
          <h3>海龟汤 · GLM-4.6V</h3>
          <p className="arcade-game-description">前端直连官方接口，Key 只保存在当前浏览器会话里。</p>
        </div>
      </div>

      <div className="turtle-config glass-panel">
        <label className="turtle-config-label" htmlFor="glm-api-key">
          <KeyRound size={15} strokeWidth={1.5} />
          GLM-4.6V API Key
        </label>
        <div className="turtle-config-row">
          <input
            id="glm-api-key"
            type="password"
            value={apiKey}
            onChange={(event) => updateApiKey(event.target.value)}
            placeholder="输入后仅保存在 sessionStorage，不会提交到 GitHub"
            className="input-minimal"
          />
          <button type="button" className="btn-outline" onClick={() => updateApiKey('')}>
            <Eraser size={15} strokeWidth={1.5} />
            清除
          </button>
        </div>
      </div>

      <div className="arcade-toolbar">
        <button type="button" className="btn-outline" onClick={startNewSoup} disabled={session.isLoading}>
          <RefreshCw size={15} strokeWidth={1.5} />
          开始新汤
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={getHint}
          disabled={!session.puzzle || session.isLoading || session.phase === 'revealed'}
        >
          <Lightbulb size={15} strokeWidth={1.5} />
          要提示
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={revealAnswer}
          disabled={!session.puzzle || session.isLoading || session.phase === 'revealed'}
        >
          <Sparkles size={15} strokeWidth={1.5} />
          揭晓真相
        </button>
      </div>

      <div className="turtle-chat">
        {session.messages.map((message) => (
          <div key={message.id} className={`turtle-message ${message.role}`}>
            <span className="turtle-message-role">{message.role === 'user' ? '你' : '主持人'}</span>
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel form-panel turtle-input-panel">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="input-minimal"
          placeholder="比如：死者是自己导致死亡的吗？或者直接提交你的完整猜想。"
        />
        <div className="turtle-action-row">
          <button
            type="button"
            className="btn-outline"
            disabled={!session.puzzle || session.isLoading || !input.trim() || session.phase === 'revealed'}
            onClick={() => void askHost('question')}
          >
            <Send size={15} strokeWidth={1.5} />
            作为提问发送
          </button>
          <button
            type="button"
            className="btn-outline"
            disabled={!session.puzzle || session.isLoading || !input.trim() || session.phase === 'revealed'}
            onClick={() => void askHost('answer')}
          >
            <Sparkles size={15} strokeWidth={1.5} />
            提交最终答案
          </button>
        </div>
      </div>

      {session.error ? <p className="error-copy">{session.error}</p> : null}
    </section>
  );
}
