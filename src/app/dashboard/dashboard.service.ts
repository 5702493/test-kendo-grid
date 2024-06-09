import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DashboardData } from './dashboard-data.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private readonly http: HttpClient) { }

  getData() {
    return this.http.get<DashboardData[]>('/assets/data.json');
  }
}
