import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GraphsService {
  private apiUrl = 'https://localhost:7096/api/Expenses';

  constructor(private http: HttpClient) {}


  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }


  getExpenseSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary`, {
      headers: this.getAuthHeaders(),
    });
  }

  getAllExpenses(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, {
      headers: this.getAuthHeaders(),
    });
  }


  addExpense(expense: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, expense, {
      headers: this.getAuthHeaders(),
    });
  }


  deleteExpense(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
