import { APIResponse } from '@playwright/test';
import { BaseApiClient } from './base-api-client';

export class OrangeHrmApiClient extends BaseApiClient {
  async getEmployeeInfo(employeeId: string): Promise<APIResponse> {
    return this.send('GET', `/pim/employees?model=detailed&employeeId=${employeeId}`);
  }

  async getJobDetails(empNumber: number): Promise<APIResponse> {
    return this.send('GET', `/pim/employees/${empNumber}/job-details`);
  }

  async createEmployee(firstName: string, lastName: string, employeeId: string): Promise<APIResponse> {
    return this.send('POST', '/pim/employees', undefined, { firstName, middleName: '', lastName, employeeId });
  }

  async deleteEmployees(empNumbers: number[]): Promise<APIResponse> {
    return this.send('DELETE', '/pim/employees', undefined, { ids: empNumbers });
  }

  async getSystemUsers(username?: string): Promise<APIResponse> {
    return this.send('GET', `/admin/users${username ? `?username=${username}` : ''}`);
  }

  async createSystemUser(username: string, password: string, userRoleId: number, empNumber: number): Promise<APIResponse> {
    return this.send('POST', '/admin/users', undefined, { username, password, status: true, userRoleId, empNumber });
  }

  async deleteEmployeeById(employeeId: string): Promise<void> {
    const response = await this.getEmployeeInfo(employeeId);
    if (!response.ok()) {
      throw new Error(`Cleanup could not look up employee ${employeeId}: HTTP ${response.status()} (session expired?)`);
    }
    const body = await response.json();
    const empNumbers = body.data.filter((e: any) => e.employeeId === employeeId).map((e: any) => e.empNumber);
    if (empNumbers.length) {
      await this.deleteEmployees(empNumbers);
    }
  }
}
