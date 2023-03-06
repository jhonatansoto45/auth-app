import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthResponse, Usuario } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl: string = environment.baseUrl;
  private _usuario!: Usuario;

  constructor(private http: HttpClient) {}

  get usuario() {
    return { ...this._usuario };
  }

  registro(name: string, email: string, password: string) {
    const url = `${this.baseUrl}/auth/new`;

    const body = { name, email, password };

    return this.http.post<AuthResponse>(url, body).pipe(
      tap(({ ok, token }) => {
        if (ok) {
          localStorage.setItem('token', token!);
        }
      }),
      map((res) => res.ok),
      catchError((err) => of(err.error.msg))
    );
  }

  login(email: string, password: string): Observable<boolean | string> {
    const url = `${this.baseUrl}/auth`;

    const body = { email, password };

    return this.http.post<AuthResponse>(url, body).pipe(
      tap((resp) => {
        if (resp.ok) {
          localStorage.setItem('token', resp.token!);
        }
      }),
      map((res) => res.ok),
      catchError((err) => of(err.error.msg))
    );
  }

  validarToken(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/renew`;

    const headers = new HttpHeaders().set(
      'x-token',
      localStorage.getItem('token') || ''
    );

    return this.http.get<AuthResponse>(url, { headers }).pipe(
      map((res) => {
        localStorage.setItem('token', res.token!);
        this._usuario = {
          name: res.name!,
          uid: res.uid!,
          email: res.email!,
        };
        return res.ok;
      }),
      catchError((err) => of(false))
    );
  }

  logout() {
    //localStorage.removeItem('token');
    localStorage.clear(); //* TODO
  }
}
