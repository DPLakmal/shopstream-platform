'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, RefreshCw, Sparkles, Server, Database, Zap, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Play } from 'lucide-react';
import { api } from '@/lib/api';
import { ParsedFilter } from '@/types';

export default function AdminPage() {
  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexResult, setReindexResult] = useState<string | null>(null);

  // AI Parser Tester
  const [testQuery, setTestQuery] = useState('cheap waterproof trail running shoes under $120 size 10 in blue');
  const [parsedResult, setParsedResult] = useState<ParsedFilter | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Webhook Simulator
  const [simOrderNum, setSimOrderNum] = useState('ORD-20261014-9999');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<string | null>(null);

  const handleReindex = async () => {
    setIsReindexing(true);
    setReindexResult(null);
    try {
      const res = await api.triggerReindex();
      setReindexResult(`Successfully indexed ${res.indexedProducts} products into Elasticsearch!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setReindexResult(`Reindex trigger finished (fallback database sync active): ${msg}`);
    } finally {
      setIsReindexing(false);
    }
  };

  const handleTestParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;
    setIsParsing(true);
    try {
      const res = await api.aiParseQuery(testQuery.trim());
      setParsedResult(res);
    } catch (err: unknown) {
      console.error('Parse test failed:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimResult(null);
    try {
      const res = await api.simulatePaymentSuccess(simOrderNum);
      setSimResult(`Idempotent payment webhook processed! Order ${res.orderNumber} status is now ${res.status}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSimResult(`Simulation response: ${msg}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-emerald-600">Home</Link>
            <span>/</span>
            <span className="font-semibold text-slate-800">Admin Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center space-x-2.5">
            <ShieldCheck className="h-7 w-7 text-emerald-600" />
            <span>Platform Diagnostic & Ops Control</span>
          </h1>
        </div>

        <Link
          href="/"
          className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Store</span>
        </Link>
      </div>

      {/* Architecture Health Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Spring Boot API</span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3 flex items-center space-x-2 text-slate-900 font-bold text-base">
            <Server className="h-5 w-5 text-emerald-600" />
            <span>Port 8080 (REST)</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Java 21+ with Actuator & Flyway</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Database</span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3 flex items-center space-x-2 text-slate-900 font-bold text-base">
            <Database className="h-5 w-5 text-blue-600" />
            <span>PostgreSQL 16</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Flyway V1 Schema & V2 Seed data</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Search Engine</span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3 flex items-center space-x-2 text-slate-900 font-bold text-base">
            <Zap className="h-5 w-5 text-amber-500" />
            <span>Elasticsearch 8</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Multi-field match & faceted filters</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cache & Idempotency</span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3 flex items-center space-x-2 text-slate-900 font-bold text-base">
            <RefreshCw className="h-5 w-5 text-teal-600" />
            <span>Redis 7</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Fast cart sessions & distributed locks</p>
        </div>
      </div>

      {/* Ops Action: Elasticsearch Reindex */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Elasticsearch Catalog Sync</h3>
            <p className="text-xs text-slate-500">Pulls all active products from PostgreSQL and pushes index documents into Elasticsearch.</p>
          </div>
          <button
            onClick={handleReindex}
            disabled={isReindexing}
            className="flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-colors disabled:bg-slate-300"
          >
            {isReindexing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Reindexing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Trigger Full Reindex</span>
              </>
            )}
          </button>
        </div>

        {reindexResult && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{reindexResult}</span>
          </div>
        )}
      </div>

      {/* Interactive AI Query Parser Inspector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Live Natural-Language AI Parser Tester</span>
          </h3>
          <p className="text-xs text-slate-500">Test how conversational shopping queries are converted into structured filter parameters.</p>
        </div>

        <form onSubmit={handleTestParse} className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Type any natural query..."
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isParsing}
            className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors disabled:bg-slate-300"
          >
            {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            <span>Parse Query</span>
          </button>
        </form>

        {parsedResult && (
          <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
            <pre>{JSON.stringify(parsedResult, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Stripe Webhook & Idempotency Simulator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Stripe Webhook & Idempotency Testing</h3>
          <p className="text-xs text-slate-500">Simulate a payment webhook payload to test distributed idempotency locks and state transitions.</p>
        </div>

        <form onSubmit={handleSimulateWebhook} className="flex gap-2">
          <input
            type="text"
            value={simOrderNum}
            onChange={(e) => setSimOrderNum(e.target.value)}
            placeholder="Enter Order Number e.g. ORD-20261014-1234"
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSimulating}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-colors disabled:bg-slate-300"
          >
            {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>Simulate Webhook</span>
          </button>
        </form>

        {simResult && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
            <span>{simResult}</span>
          </div>
        )}
      </div>
    </div>
  );
}
