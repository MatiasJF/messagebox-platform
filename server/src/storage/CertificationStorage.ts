/**
 * MongoDB storage layer for certified users
 */

import { Collection, Db, MongoClient } from 'mongodb'
import { CertifiedUser } from '../types.js'

export class CertificationStorage {
  private client: MongoClient
  private db: Db
  private collection: Collection<CertifiedUser>

  constructor(mongoUri: string, dbName: string) {
    this.client = new MongoClient(mongoUri)
    this.db = this.client.db(dbName)
    this.collection = this.db.collection<CertifiedUser>('certified_users')
  }

  /**
   * Initialize the MongoDB connection and create indexes
   */
  async connect(): Promise<void> {
    await this.client.connect()
    console.log('Connected to MongoDB')

    // Create unique index on identityKey
    await this.collection.createIndex({ identityKey: 1 }, { unique: true })
    console.log('Indexes created')
  }

  /**
   * Close the MongoDB connection
   */
  async disconnect(): Promise<void> {
    await this.client.close()
    console.log('Disconnected from MongoDB')
  }

  /**
   * Store a certified user in the database
   */
  async storeCertification(user: CertifiedUser): Promise<void> {
    await this.collection.updateOne(
      { identityKey: user.identityKey },
      { $set: user },
      { upsert: true }
    )
  }

  /**
   * Get a certified user by identity key
   */
  async getCertifiedUser(identityKey: string): Promise<CertifiedUser | null> {
    return await this.collection.findOne({ identityKey })
  }

  /**
   * List all certified users
   */
  async listAllCertifiedUsers(): Promise<CertifiedUser[]> {
    return await this.collection
      .find({})
      .sort({ certificationDate: -1 })
      .toArray()
  }

  /**
   * Search certified users by alias
   */
  async searchByAlias(query: string): Promise<CertifiedUser[]> {
    return await this.collection
      .find({
        alias: { $regex: query, $options: 'i' }
      })
      .sort({ certificationDate: -1 })
      .toArray()
  }

  /**
   * Delete a certification
   */
  async deleteCertification(identityKey: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ identityKey })
    return result.deletedCount > 0
  }
}
