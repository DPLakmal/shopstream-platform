import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Zap, RefreshCw, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      {/* Platform Guarantees Banner */}
      <div className="border-b border-slate-100 bg-slate-50/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">AI-Powered Search</h4>
                <p className="text-xs text-slate-500">Natural language parsed to structured filters</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Idempotent Checkout</h4>
                <p className="text-xs text-slate-500">Duplicate protection & Stripe Webhook safety</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Sub-second Latency</h4>
                <p className="text-xs text-slate-500">Redis cache & Elasticsearch multi-field index</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Automated Sync</h4>
                <p className="text-xs text-slate-500">Flyway migrations & DB transactional outbox</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-900 uppercase">Shop</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li><Link href="/products?category=Audio+%26+Sound" className="hover:text-emerald-600">Audio & Sound</Link></li>
              <li><Link href="/products?category=Electronics" className="hover:text-emerald-600">Computers & Tech</Link></li>
              <li><Link href="/products?category=Wearables+%26+Smartwatches" className="hover:text-emerald-600">Wearables</Link></li>
              <li><Link href="/products?category=Apparel+%26+Footwear" className="hover:text-emerald-600">Outdoor & Apparel</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-900 uppercase">Architecture</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li><span className="text-slate-500">Next.js 15 & React 19</span></li>
              <li><span className="text-slate-500">Spring Boot 3.4 & Java 21</span></li>
              <li><span className="text-slate-500">Elasticsearch 8 & Redis 7</span></li>
              <li><span className="text-slate-500">PostgreSQL 16 & Flyway</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-900 uppercase">DevOps & Cloud</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li><span className="text-slate-500">AWS ECS Fargate</span></li>
              <li><span className="text-slate-500">AWS RDS & S3 / CloudFront</span></li>
              <li><span className="text-slate-500">Docker & Docker Compose</span></li>
              <li><span className="text-slate-500">GitHub Actions CI/CD</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-900 uppercase">System</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li><Link href="/admin" className="hover:text-emerald-600">Admin Diagnostics</Link></li>
              <li><a href="http://localhost:8080/actuator/health" target="_blank" rel="noreferrer" className="hover:text-emerald-600">Actuator Health</a></li>
              <li><a href="http://localhost:8080/api/v1/products" target="_blank" rel="noreferrer" className="hover:text-emerald-600">REST API Feed</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ShopStream Platform. Built for high-concurrency e-commerce.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Powered by</span>
            <span className="font-semibold text-emerald-600">Elasticsearch & Gemini AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
