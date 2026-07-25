import React, { useState } from 'react';
import { CommentItem, Sentiment, User, Coin } from '../types';
import { Language, translations } from '../translations';
import { MessageSquare, ThumbsUp, ThumbsDown, Pin, Send, Award, Flame, Filter, MessageCircle } from 'lucide-react';

interface CommunityCommentsProps {
  coin: Coin;
  comments: CommentItem[];
  user: User;
  lang: Language;
  onPostComment: (text: string, sentiment: Sentiment) => Promise<void>;
  onVoteComment: (commentId: string, voteType: 'up' | 'down') => Promise<void>;
}

export const CommunityComments: React.FC<CommunityCommentsProps> = ({
  coin,
  comments,
  user,
  lang,
  onPostComment,
  onVoteComment,
}) => {
  const t = translations[lang];

  const [text, setText] = useState<string>('');
  const [sentiment, setSentiment] = useState<Sentiment>('bullish');
  const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish' | 'pinned'>('all');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await onPostComment(text, sentiment);
    setText('');
    setIsSubmitting(false);
  };

  const filteredComments = comments.filter((c) => {
    if (filter === 'pinned') return c.pinned;
    if (filter === 'bullish') return c.sentiment === 'bullish';
    if (filter === 'bearish') return c.sentiment === 'bearish';
    return true;
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide">{t.community}</h2>
            <p className="text-xs text-slate-400 font-medium">
              Join discussions for {coin.name} ({coin.symbol}) and earn comment reward points!
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({comments.length})
          </button>
          <button
            onClick={() => setFilter('bullish')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'bullish' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🚀 Bullish
          </button>
          <button
            onClick={() => setFilter('bearish')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'bearish' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📉 Bearish
          </button>
        </div>
      </div>

      {/* Comment Input Box */}
      <form onSubmit={handleSubmit} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-slate-400">Sentiment Tag:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSentiment('bullish')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                sentiment === 'bullish'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              🚀 {t.bullish}
            </button>
            <button
              type="button"
              onClick={() => setSentiment('bearish')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                sentiment === 'bearish'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              📉 {t.bearish}
            </button>
            <button
              type="button"
              onClick={() => setSentiment('neutral')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                sentiment === 'neutral'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              💬 {t.neutral}
            </button>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.commentPlaceholder}
          rows={3}
          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition resize-none"
        />

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
            <Award className="w-4 h-4" />
            <span>Post comment to earn +15 Points</span>
          </div>

          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Posting...' : t.postButton}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm bg-slate-950/40 rounded-2xl border border-slate-800/80">
            No comments yet under this filter. Be the first to share your analysis!
          </div>
        ) : (
          filteredComments.map((c) => {
            const isBullish = c.sentiment === 'bullish';
            const isBearish = c.sentiment === 'bearish';

            return (
              <div
                key={c.id}
                className={`bg-slate-950/60 border rounded-2xl p-4 transition ${
                  c.pinned ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white">{c.username}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-mono font-bold border border-slate-700">
                      👑 {c.userRank}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                      {c.userPoints.toLocaleString()} PTS
                    </span>

                    {/* Sentiment Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isBullish
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : isBearish
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {c.sentiment}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    {c.pinned && (
                      <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        <Pin className="w-3 h-3" />
                        {t.pinnedByAdmin}
                      </span>
                    )}
                    <span>{c.timestamp}</span>
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-sm text-slate-200 leading-relaxed my-2">
                  {c.text
                    .replace(/TripToCoin/g, coin.name || 'Token')
                    .replace(/\$TTC/g, `$${coin.symbol || 'TOKEN'}`)
                    .replace(/\bTTC\b/g, coin.symbol || 'TOKEN')}
                </p>

                {/* Footer Controls: Upvote / Downvote */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onVoteComment(c.id, 'up')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono font-semibold transition ${
                        c.userVote === 'up'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{c.upvotes}</span>
                    </button>

                    <button
                      onClick={() => onVoteComment(c.id, 'down')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono font-semibold transition ${
                        c.userVote === 'down'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{c.downvotes}</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    Vote Influence Weighted by Points
                  </span>
                </div>

                {/* Replies if any */}
                {c.replies && c.replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-slate-800 space-y-2">
                    {c.replies.map((reply) => (
                      <div key={reply.id} className="bg-slate-900/60 rounded-xl p-2.5 text-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="font-bold text-slate-200">{reply.username}</span>
                          <span className="font-mono text-[10px]">{reply.timestamp}</span>
                        </div>
                        <p className="text-slate-300">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
