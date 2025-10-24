# API Gateway Pix

## Setup

### 1. Clone o repositório

```bash
git clone https://github.com/alegrevers/colmeiaBackend.git
cd colmeiaBackend
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env
```

### 3. Inicie o prisma e crie as tabelas necessárias

```bash
npx prisma generate
npx prisma db push
```

### 4. Instale as dependências

```bash
npm install
```

### 5. Inicie a aplicação

```bash
npm run dev
```

A API estará disponível em:
- **API**: http://localhost:3000/api

## Endpoints

### Customers

#### `POST /v1/customers`

Cria um novo Customer.

**Request:**
```json
{
    "name": "Gabriel Alegrete",
    "email": "gabriel2@example.com",
    "document": "123.456.789-01",
    "phone": "+55 11 99999-9992"
}
```

**Response:**
```json
{
    "id": "uuid",
    "name": "Gabriel Alegrete",
    "email": "gabriel2@example.com",
    "document": "123.456.789-01",
    "phone": "+55 11 99999-9992",
    "createdAt": "2025-10-24T21:38:10.788Z"
}
```

### Cobranças

#### `POST /v1/charges`

Cria nova cobrança Pix.

**Request:**
```json
{
    "customer_id": "uuid",
    "amount": 15000,
    "payment_method": "pix",
    "payment_details": {
        "pix_key": "meuemail@pix.com",
        "expires_at": "2025-10-30T23:59:59Z"
    },
    "metadata": {
        "order_id": "ORD123"
    }
}
```

**Response:**
```json
{
    "id": "uuid",
    "amount": 15000,
    "status": "pending",
    "currency": "BRL",
    "metadata": {
        "order_id": "ORD123"
    },
    "createdAt": "2025-10-24T21:01:57.189Z",
    "expiresAt": "2025-10-30T23:59:59.000Z",
    "customerId": "uuid",
    "paymentMethod": "pix",
    "paymentDetails": {
        "pix_key": "meuemail@pix.com",
        "qr_code": "000201...77ivij"
    }
}
```

#### `POST /v1/charges`

Cria nova cobrança Cartão.

**Request:**
```json
{
    "customer_id": "uuid",
    "amount": 50000,
    "payment_method": "card",
    "payment_details": {
        "card_holder_name": "Gabriel Alegrete",
        "card_last4": "4242",
        "installments": 3,
        "auto_capture": true
    },
    "metadata": {
        "order_id": "ORD124"
    }
}
```

**Response:**
```json
{
    "id": "uuid",
    "amount": 50000,
    "status": "pending",
    "currency": "BRL",
    "metadata": {
        "order_id": "ORD124"
    },
    "createdAt": "2025-10-24T21:02:12.041Z",
    "expiresAt": null,
    "customerId": "uuid",
    "paymentMethod": "card",
    "paymentDetails": {
        "card_last4": "4242",
        "installments": 3
    }
}
```

#### `POST /v1/charges`

Cria nova cobrança Boleto.

**Request:**
```json
{
    "customer_id": "uuid",
    "amount": 20000,
    "payment_method": "boleto",
    "payment_details": {
        "due_date": "2025-11-05",
        "boleto_url": "https://boleto.fake/boleto123",
        "barcode": "23793381286007800000600000012345678901234567"
    },
    "metadata": {
        "order_id": "ORD125"
    }
}
```

**Response:**
```json
{
    "id": "uuid",
    "amount": 20000,
    "status": "pending",
    "currency": "BRL",
    "metadata": {
        "order_id": "ORD125"
    },
    "createdAt": "2025-10-24T21:02:26.192Z",
    "expiresAt": null,
    "customerId": "uuid",
    "paymentMethod": "boleto",
    "paymentDetails": {
        "barcode": "23793381286007800000600000012345678901234567",
        "due_date": "2025-11-05",
        "boleto_url": "https://boleto.fake/boleto123"
    }
}
```

### Health Check

#### `GET /health`

Verifica a integridade da aplicação.

## Estrutura de Dados

### PostgreSQL - Customers

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  document VARCHAR(14) NOT NULL UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_document ON customers(document);
```

### PostgreSQL - Carges

```sql
CREATE TABLE charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  metadata JSONB,
  payment_details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_charges_status ON charges(status);
CREATE INDEX idx_charges_customer_id ON charges(customer_id);
CREATE INDEX idx_charges_created_at ON charges(created_at);
CREATE INDEX idx_charges_expires_at ON charges(expires_at);
```

## Fluxo de Pagamento

1. Cliente se registra via `POST /v1/customers`
2. Cliente cria cobrança via `POST /charges`
3. Sistema armazena no PostgreSQL com status `pending`
4. Sistema retorna `pix_key`, `qr_code`, `card_last4`, `installments`, `barcode`, `due_date`, `boleto_url` e `charge_id`