import { useState } from "react";
import api from "../services/api";

const CATEGORY_COLORS = {
  Hot: "bg-red-100 text-red-700",
  Warm: "bg-yellow-100 text-yellow-700",
  Cold: "bg-blue-100 text-blue-700",
};

const AIInsightsModal = ({ open, onClose, lead }) => {
  const [scoreResult, setScoreResult] = useState(null);
  const [messageResult, setMessageResult] = useState(null);
  const [probabilityResult, setProbabilityResult] = useState(null);

  const [loadingScore, setLoadingScore] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [loadingProbability, setLoadingProbability] = useState(false);

  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleScore = async () => {
    setLoadingScore(true);
    setError("");
    try {
      const res = await api.post("/ai/lead-score", { leadId: lead._id });
      setScoreResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not score this lead");
    } finally {
      setLoadingScore(false);
    }
  };

  const handleMessage = async () => {
    setLoadingMessage(true);
    setError("");
    setCopied(false);
    try {
      const res = await api.post("/ai/followup-message", { leadId: lead._id });
      setMessageResult(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate a message");
    } finally {
      setLoadingMessage(false);
    }
  };

  const handleProbability = async () => {
    setLoadingProbability(true);
    setError("");
    try {
      const res = await api.post("/ai/conversion-probability", { leadId: lead._id });
      setProbabilityResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not estimate conversion probability");
    } finally {
      setLoadingProbability(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    // Reset everything so old results don't leak into the next lead opened
    setScoreResult(null);
    setMessageResult(null);
    setProbabilityResult(null);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">AI Insights</h3>
            <p className="text-sm text-gray-500">{lead?.name} {lead?.company ? `· ${lead.company}` : ""}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {error && <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</div>}

        {/* AI Lead Scoring */}
        <div className="border border-gray-200 rounded-lg p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800">🤖 AI Lead Score</h4>
            <button
              onClick={handleScore}
              disabled={loadingScore}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingScore ? "Scoring..." : scoreResult ? "Re-score" : "Score Lead"}
            </button>
          </div>
          {scoreResult && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-gray-800">{scoreResult.score}/100</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[scoreResult.category]}`}>
                  {scoreResult.category}
                </span>
              </div>
              <p className="text-sm text-gray-600">{scoreResult.reason}</p>
            </div>
          )}
        </div>

        {/* AI Follow-up Message Generator */}
        <div className="border border-gray-200 rounded-lg p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800">✉️ AI Follow-up Message</h4>
            <button
              onClick={handleMessage}
              disabled={loadingMessage}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingMessage ? "Generating..." : messageResult ? "Regenerate" : "Generate"}
            </button>
          </div>
          {messageResult && (
            <div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded p-3 mb-2 whitespace-pre-wrap">{messageResult}</p>
              <button onClick={handleCopy} className="text-xs text-blue-600 hover:underline">
                {copied ? "Copied!" : "Copy message"}
              </button>
            </div>
          )}
        </div>

        {/* AI Conversion Probability */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800">📈 Conversion Probability</h4>
            <button
              onClick={handleProbability}
              disabled={loadingProbability}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingProbability ? "Estimating..." : probabilityResult ? "Re-estimate" : "Estimate"}
            </button>
          </div>
          {probabilityResult && (
            <div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{probabilityResult.probability}%</p>
              <p className="text-sm text-gray-600">{probabilityResult.explanation}</p>
              <p className="text-xs text-gray-400 mt-2 italic">AI-generated estimate — not a statistically validated prediction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsightsModal;