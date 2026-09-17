import { APIResponse } from '@playwright/test';
import { BaseApiClient } from './base-api-client';

export class OrangeHrmApiClient extends BaseApiClient {
  async getEmployeeInfo(employeeId: string): Promise<APIResponse> {
    return this.send('GET', `/pim/employees?model=detailed&employeeId=${employeeId}`);
  }

  async getJobDetails(empNumber: number): Promise<APIResponse> {
    return this.send('GET', `/pim/employees/${empNumber}/job-details`);
  }
}
