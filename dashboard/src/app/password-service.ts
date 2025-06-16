import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";

export interface PasswordEntry {
  id: string;
  password: string;
  domain: string;
}

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private apiUrl = 'http://localhost:8080/api/password';

  constructor(private http: HttpClient) {}

  createPassword(entry: { password: string; domain: string }): Observable<void> {
    return this.http.post<void>(this.apiUrl, entry);
  }

  getPasswordsByDomain(domain: string): Observable<{ data: PasswordEntry[] }> {
    const params = new HttpParams().set('domain', domain);
    return this.http.get<{ data: PasswordEntry[] }>(this.apiUrl, { params });
  }
}
