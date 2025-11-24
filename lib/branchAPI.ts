// API utility functions for branch management
import { BaseAPI } from './baseAPI'

export interface BranchCreateData {
  name: string
  code: string
  address: string
  phone: string
  email: string
  manager_id?: string
  settings: {
    active: boolean
  }
}

export interface BranchResponse {
  message: string
  branch_id: string
}

class BranchAPI extends BaseAPI {
  async createBranch(data: BranchCreateData, token: string): Promise<BranchResponse> {
    return await this.makeRequest('/api/branches', {
      method: 'POST',
      body: data,
      token
    })
  }

  async getBranches(token: string): Promise<any> {
    return await this.makeRequest('/api/branches', {
      method: 'GET',
      token
    })
  }

  async getBranchById(branchId: string, token: string): Promise<any> {
    return await this.makeRequest(`/api/branches/${branchId}`, {
      method: 'GET',
      token
    })
  }

  async updateBranch(branchId: string, data: Partial<BranchCreateData>, token: string): Promise<any> {
    return await this.makeRequest(`/api/branches/${branchId}`, {
      method: 'PUT',
      body: data,
      token
    })
  }

  async deleteBranch(branchId: string, token: string): Promise<any> {
    return await this.makeRequest(`/api/branches/${branchId}`, {
      method: 'DELETE',
      token
    })
  }
}

export const branchAPI = new BranchAPI()
