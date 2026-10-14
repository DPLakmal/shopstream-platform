# ShopStream — Scalable E-commerce Platform with AI Search

ShopStream is an enterprise-grade, full-stack e-commerce platform designed for high concurrency, sub-millisecond search latencies, and fault-tolerant financial transactions.

```
       React / Next.js 15 (TypeScript + Tailwind)
                          │
                          ▼
       Spring Boot 3.4 (Java 21+) REST API Layer
       ┌──────────────────┬─────────────────┐
       ▼                  ▼                 ▼
PostgreSQL 16          Redis 7        Elasticsearch 8
(ACID Data Store)   (Cart & Locks)    (Search & Facets)
       ▲                                    ▲
       │                                    │
  Stripe SDK                         Gemini / AI NLP
(Idempotent Payments)             (Intent to Filters)
```

---

## Key Highlights

- **AI-Powered Natural Language Search**: Converts conversational queries (e.g. *"waterproof running shoes under $120 size 10 in blue"* or *"cheap wireless noise canceling headphones for gym"*) into structured filters (`minPrice`, `maxPrice`, `category`, `brand`, `tags`, `sort`) in real time, drastically reducing search friction and boosting conversion.
- **Elasticsearch Catalog Engine**: Multi-match full text search with field boosting (`title^3`, `brand^2`, `tags^2`, `description^1`) and dynamic faceted aggregations.
- **Idempotent Stripe Payment Processing**: Distributed idempotency locks (Redis + PostgreSQL `idempotency_records`) and cryptographic webhook signature verification (`Stripe-Signature`) guaranteeing zero duplicate charges or repeat fulfillments during network retries or concurrent checkouts.
- **High-Speed Redis Cart Service**: Sub-millisecond cart reads and atomic line item modifications, with local caching fallbacks and database synchronization.
- **AWS Cloud Native**: Ready for AWS ECS Fargate, Amazon RDS PostgreSQL Multi-AZ, Amazon ElastiCache Redis, OpenSearch, and S3 + CloudFront CDN. Includes complete `docker-compose.yml` and GitHub Actions CI/CD workflows.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14/15, React 18/19, TypeScript, Tailwind CSS, Lucide Icons, Stripe Elements |
| **Backend** | Spring Boot 3.4, Java 21+, Spring Data JPA, Spring Data Redis, Spring Data Elasticsearch |
| **Databases** | PostgreSQL 16 (Flyway migrations), Redis 7 (Caching & Locks), Elasticsearch 8.13 |
| **Payments & AI** | Stripe Java SDK (v26), Google Gemini AI API with hybrid offline NLP regex fallback |
| **DevOps & Cloud** | Docker, Docker Compose, AWS ECS Fargate, Amazon RDS, Amazon S3, CloudFront, GitHub Actions |

---

## Quickstart Guide

### Option 1: Full-Stack with Docker Compose (Recommended)

Start the entire environment (Postgres, Redis, Elasticsearch, Spring Boot, and Next.js) with a single command:

```bash
docker compose up --build
```

- **Frontend Storefront**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:8080](http://localhost:8080)
- **Admin Diagnostics**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Actuator Health**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
- **Elasticsearch API**: [http://localhost:9200](http://localhost:9200)

---

### Option 2: Running Locally

#### 1. Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

The backend boots with automatic database migrations (Flyway V1 Schema and V2 Seed Data) and initializes the 13 seed products across Electronics, Audio, Wearables, Outdoor, and Home appliances.

#### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Browse to [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## API Documentation & Examples

### 1. AI Search & Intent Parser

#### Natural Language Search
```bash
curl -X GET "http://localhost:8080/api/v1/search?q=waterproof+trail+running+shoes+under+%24130&aiMode=true"
```

#### Raw Intent Parser Inspection
```bash
curl -X POST "http://localhost:8080/api/v1/search/ai-parse" \
  -H "Content-Type: application/json" \
  -d '{"query": "cheap wireless headphones under $100 with high rating"}'
```

*Sample Response:*
```json
{
  "originalQuery": "cheap wireless headphones under $100 with high rating",
  "searchTerm": "headphones",
  "category": "Audio & Sound",
  "brand": null,
  "minPrice": null,
  "maxPrice": 100.0,
  "minRating": 4.5,
  "inStockOnly": false,
  "sortBy": "PRICE_ASC",
  "tags": ["wireless", "headphones"],
  "detectedIntent": "Intent: Category [Audio & Sound] Price <= $100 Tags [wireless, headphones]",
  "parserType": "HYBRID_NLP"
}
```

### 2. High-Speed Cart Operations (Redis)

```bash
# Add Item to Cart
curl -X POST "http://localhost:8080/api/v1/cart/items" \
  -H "Content-Type: application/json" \
  -H "X-Cart-Id: cart_demo_123" \
  -d '{"productId": 1, "quantity": 1}'
```

### 3. Idempotent Order Creation & Stripe Payment

```bash
# Create Order with Idempotency Key
curl -X POST "http://localhost:8080/api/v1/orders" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: idemp_sample_key_999" \
  -d '{
    "customerEmail": "alex@example.com",
    "customerName": "Alex Mercer",
    "shippingAddress": "742 Evergreen Terrace",
    "items": [{"productId": 1, "quantity": 1}]
  }'
```

### 4. Trigger Elasticsearch Reindex

```bash
curl -X POST "http://localhost:8080/api/v1/search/reindex"
```

---

## Automated Testing

```bash
# Run Backend Unit & Integration Tests (AI Parser, Idempotency, Cart)
cd backend
mvn test

# Run Frontend Linter & Typechecks
cd frontend
npm run lint
```
