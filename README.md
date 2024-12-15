# System Setup Guide

## Prerequisites

### Required Downloads
- **MongoDB Community Server** (Optional for localhost): [Download](https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.4-signed.msi)
- **MongoDB Compass** (Optional for localhost): [Download](https://downloads.mongodb.com/compass/mongosh-2.3.6-win32-x64.zip)
- **Composer**: [Download](https://getcomposer.org/Composer-Setup.exe)
- **Laragon**: [Download](https://github.com/leokhoa/laragon/releases/download/6.0.0/laragon-wamp.exe)

---

## Installation Steps

### 1. Composer Setup
1. Run the Composer installer.
2. Select **Install for all users** > **Developer Mode**.
3. Choose the `php-8.4.1` folder for `php.exe`.
4. Complete the installation.

### 2. MongoDB Installation (For localhost setup)
1. Install MongoDB Community Server:
   - Select **Complete** > **Run Service as Network Service User**.
   - Finish the installation.
2. Install MongoDB Compass:
   - Connect to `localhost` and create a new cluster named `uvluate`.

### 3. Laragon Setup
1. Install Laragon.
2. Create a new database named `uvluate`.

---

## Backend Setup
1. Navigate to the `phpbackend` folder using the command prompt.
2. Run the following commands:
   ```bash
   composer install
   php setup.php
   ```
   - This will create the MySQL tables and populate MongoDB.
3. Start the backend server:
   ```bash
   php -S localhost:8000
   ```

---

## Frontend Setup
1. Navigate to the `uvluate` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm start
   ```

---

## Admin Account
- **Admin ID**: `Admin`
- **Password**: `Admin`
- **Note**: OTP functionality is bypassed for development. Find the OTP in the `auth` table of the database.

---

## Future Development
- **Planned Features**:
  - Migration to React Native for hybrid mobile applications.
  - Integration of GraphQL with REST APIs.




## Group 4
- Anton Neil Y. Andales
- Rhea Mae D. Borromeo
- Jeralyn U. Tapia
- Kelvin O. Manipis
- Jovenil G. Millanes, Jr.
- Justin Rick G. Delava