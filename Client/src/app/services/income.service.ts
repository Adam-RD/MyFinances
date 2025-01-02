import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IncomeService {

  private apiUrl = `${environment.apiUrl}/Incomes`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getIncomes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, { headers: this.getAuthHeaders() });
  }

  getIncomeSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary`, { headers: this.getAuthHeaders() });
  }

  getBalance(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/balance`, { headers: this.getAuthHeaders() });
  }

  addIncome(income: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, income, { headers: this.getAuthHeaders() });
  }

  updateIncome(id: number, income: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, income, { headers: this.getAuthHeaders() });
  }

  deleteIncome(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getExpenses(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getExpenseDetails(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary`, { headers: this.getAuthHeaders() });
  }

  addExpense(expense: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, expense, { headers: this.getAuthHeaders() });
  }

  deleteExpense(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
