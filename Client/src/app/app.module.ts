import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { NgChartsModule } from 'ng2-charts';
import { GraphsComponent } from './components/graphs/graphs.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { IncomesComponent } from './components/incomes/incomes.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({ declarations: [
        AppComponent,
        LoginComponent,
        RegisterComponent,
        HomeComponent,
        GraphsComponent,
        IncomesComponent
    ],
    bootstrap: [AppComponent], imports: [NgChartsModule,
        NgxPaginationModule,
        NgxChartsModule,
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            timeOut: 3000,
            positionClass: 'toast-bottom-right',
            preventDuplicates: true
        })], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
