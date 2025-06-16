# Password Encryption/Decryption Implementation Plan

## Overview
This document outlines the implementation plan for encrypting the `password` field in `PasswordEntity` using AES-256 algorithm with JPA Converter for automatic encryption/decryption during database operations.

## Architecture Overview
- **Encryption Algorithm**: AES-256
- **Implementation Pattern**: JPA AttributeConverter
- **Key Management**: Application-level secret key stored in application properties
- **Automatic Processing**: Encryption on persist, decryption on retrieval

## Implementation Components

### 1. Encryption Service (`PasswordEncryptionService`)
**Location**: `backend/src/main/java/com/jpozarycki/backend/password/encryption/PasswordEncryptionService.java`

**Responsibilities**:
- Provide AES-256 encryption/decryption methods
- Handle key generation and management
- Manage encryption exceptions

**Key Methods**:
- `encrypt(String plainText): String` - Encrypts plain text password
- `decrypt(String encryptedText): String` - Decrypts encrypted password
- `generateKey(): SecretKey` - Generates AES-256 key from configured secret

### 2. JPA Attribute Converter (`PasswordAttributeConverter`)
**Location**: `backend/src/main/java/com/jpozarycki/backend/password/encryption/PasswordAttributeConverter.java`

**Responsibilities**:
- Implement `AttributeConverter<String, String>` interface
- Automatically encrypt passwords before database persistence
- Automatically decrypt passwords after database retrieval
- Handle null values gracefully

**Key Methods**:
- `convertToDatabaseColumn(String attribute): String` - Encrypts password for storage
- `convertToEntityAttribute(String dbData): String` - Decrypts password from storage

### 3. Encryption Configuration (`EncryptionConfiguration`)
**Location**: `backend/src/main/java/com/jpozarycki/backend/configuration/EncryptionConfiguration.java`

**Responsibilities**:
- Configure encryption properties
- Provide beans for encryption components
- Validate encryption key configuration

### 4. Update PasswordEntity
**Location**: `backend/src/main/java/com/jpozarycki/backend/password/PasswordEntity.java`

**Changes**:
- Add `@Convert` annotation to password field
- Ensure proper JPA annotations
- Add necessary getters/setters with Lombok

## Implementation Steps

### Step 1: Add Required Dependencies
No additional dependencies needed - Java's built-in `javax.crypto` package supports AES-256.

### Step 2: Create Encryption Service
1. Create `encryption` package under `password` package
2. Implement `PasswordEncryptionService` with:
   - AES-256 encryption logic
   - Base64 encoding for storage
   - Proper exception handling
   - Thread-safe implementation

### Step 3: Implement JPA Converter
1. Create `PasswordAttributeConverter` class
2. Annotate with `@Converter`
3. Implement conversion methods with null-safety
4. Inject `PasswordEncryptionService`

### Step 4: Update PasswordEntity
1. Add `@Convert(converter = PasswordAttributeConverter.class)` to password field
2. Ensure entity has proper JPA annotations
3. Add Lombok annotations for getters/setters

### Step 5: Configure Encryption Properties
1. Add encryption key to `application.properties`:
   ```properties
   encryption.secret-key=${ENCRYPTION_SECRET_KEY:default-256-bit-secret-key-change-in-prod}
   ```
2. Create configuration class to validate key length (32 bytes for AES-256)

### Step 6: Security Considerations
1. Store encryption key as environment variable in production
2. Implement key rotation strategy
3. Add logging for encryption operations (without exposing sensitive data)
4. Consider using AWS KMS or similar for key management in production

## Technical Details

### AES-256 Implementation
- **Mode**: AES/GCM/NoPadding (recommended for authenticated encryption)
- **Key Size**: 256 bits (32 bytes)
- **IV Size**: 96 bits (12 bytes) for GCM mode
- **Tag Size**: 128 bits (16 bytes) for GCM mode

### Data Format
- Encrypted data format: `Base64(IV + encrypted_data + auth_tag)`
- This ensures each encryption operation uses a unique IV

### Error Handling
- Encryption failures should throw runtime exceptions
- Decryption failures should be logged and handled gracefully
- Consider fallback strategies for migration scenarios

## Migration Strategy
1. For existing unencrypted passwords:
   - Create migration script to encrypt existing data
   - Use Liquibase changeset for database migration
   - Implement backward compatibility during transition

## Performance Considerations
- Encryption/decryption adds minimal overhead (~1-2ms per operation)
- Consider caching decrypted values in application layer if needed
- Monitor performance impact in production

## Testing Strategy
1. Unit tests for `PasswordEncryptionService`
2. Integration tests for `PasswordAttributeConverter`
3. End-to-end tests for password save/retrieve operations
4. Performance tests for bulk operations

## Security Best Practices
1. Never log decrypted passwords
2. Use strong, randomly generated encryption keys
3. Implement proper key rotation mechanism
4. Consider using hardware security modules (HSM) for production
5. Regular security audits of encryption implementation

## Future Enhancements
1. Implement key rotation without data re-encryption
2. Add support for multiple encryption algorithms
3. Implement field-level encryption for other sensitive data
4. Consider implementing envelope encryption pattern 