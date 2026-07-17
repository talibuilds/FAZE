<div align="center">
  
  # 🔒 F A Z E
  **Unlock what's worth it.**

  *A Next-Generation Premium Media Locker & Digital Asset Marketplace*

  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
  ![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

</div>

---

## 📥 Download the App (Android APK)

The application is officially built in the cloud via **Expo Application Services (EAS)**. You can download the production-ready `.apk` directly from the Expo servers.

<div align="center">
  <img src="./assets/qr.png" width="200" alt="Download QR Code" />
  
  <br/>

  [![Download APK](https://img.shields.io/badge/Download_APK-EAS_Build-black?style=for-the-badge&logo=expo)](https://expo.dev/accounts/talibuilds/projects/faze-mobile/builds/6a29461f-5a45-4d01-ad24-8c85acc43593)
</div>

---

## 📱 Application Preview

<div align="center">
  <img src="./assets/login.png" width="250" alt="Login Screen" />
  &nbsp;&nbsp;&nbsp;
  <img src="./assets/feed.png" width="250" alt="Feed Screen" />
  &nbsp;&nbsp;&nbsp;
  <img src="./assets/home.png" width="250" alt="Home Screen" />
</div>

---

## 🌟 About FAZE

FAZE is a robust mobile application that allows creators to monetize their premium media. Users upload high-resolution images and attach a coin value. Other users browse heavily compressed, watermarked previews for free. To see the crystal-clear original, users must spend digital coins from their integrated FAZE wallet. 

The entire system is powered by a **Zero-Trust Secure Stream Proxy**, ensuring original files are physically impossible to scrape without an authenticated purchase.

### ✨ Key Features
- **🪙 Internal Digital Economy**: A fully functioning wallet system allowing users to accumulate and spend digital coins.
- **🔒 Secure Media Proxy**: Real-time ownership validation. Original files are streamed securely as buffers directly to the mobile client through an authenticated JWT layer.
- **🎨 Modern Dark UI**: A sleek, premium glassmorphic dark-mode interface built with React Native.
- **☁️ Serverless & Cloud Ready**: Fully containerized backend running on Render, powered by Supabase's high-performance Postgres connection pooler and S3-compatible cloud storage.

---

## 🛡️ Security & Privacy Architecture

> [!IMPORTANT]
> The backend acts as a **Zero-Trust Secure Stream Proxy**. Direct S3 or CDN links are *never* exposed to the client application, ensuring that original media cannot be scraped, shared, or bypassed.

*   **Strict Access Control**: All media access requests are forcefully routed through the `/api/media/proxy` endpoint, which sits entirely behind our JWT authentication middleware.
*   **Private Media Storage**: Original high-resolution files and compressed previews are stored in a private S3 bucket. Public internet access is completely disabled.
*   **Real-Time Ownership Validation**: Before the backend proxy streams any file prefixed with `original-`, it performs a live database transaction via Prisma to verify that the requesting user either natively owns the media or holds a valid `Purchase` record.
*   **Secure Mobile Delivery**: The React Native frontend is securely configured to pass the active session's Bearer token inside the HTTP headers of all native `<Image>` components.

---

## 🏗️ System Architecture

The following diagram illustrates the high-level architecture of FAZE, showing how the mobile client, API backend, database, and S3 storage interact:

```mermaid
graph TD
    Client[📱 React Native App]
    Backend[⚙️ Node.js / Express API]
    DB[(🐘 Supabase PostgreSQL)]
    S3[(🪣 Supabase S3 Storage)]

    Client <-->|REST API + JWT| Backend
    Backend <-->|Prisma ORM over IPv4 Pooler| DB
    Backend <-->|AWS SDK v3| S3

    subgraph Secure Media Flow
        Client -->|A. Request Proxy Image + JWT| Backend
        Backend -->|B. Validate DB Ownership| DB
        Backend -->|C. Fetch Secure Stream| S3
        S3 -->|D. Return Buffer| Backend
        Backend -->|E. Pipe Stream to App| Client
    end
```

---

## 🗄️ Database ER Diagram

The relational PostgreSQL database is managed via Prisma. Here is the Entity-Relationship (ER) model:

```mermaid
erDiagram
    User ||--o{ Media : "owns"
    User ||--o{ Purchase : "makes"
    User ||--o{ Transaction : "has"
    Media ||--o{ Purchase : "unlocked by"

    User {
        String id PK
        String email UK
        String name
        Int walletBalance
    }
    
    Media {
        String id PK
        String ownerId FK
        String title
        String previewKey
        String originalKey
        Int price
    }
    
    Purchase {
        String id PK
        String userId FK
        String mediaId FK
        Int amountPaid
    }
    
    Transaction {
        String id PK
        String userId FK
        String type
        Int amount
        String reason
    }
```

---

## 👨‍💻 Author

Built with ❤️ by **Talib Khan**.
