import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpotifyLoginComponentComponent} from "./spotify-login-component/spotify-login-component.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SpotifyLoginComponentComponent],
  template: `
    <h1 class="bg-red-300 text-2xl">Welcome to {{title}}!</h1>
    <p>test</p>
    <app-spotify-login-component></app-spotify-login-component>
    <router-outlet />
  `,
  styles: [],
})
export class AppComponent {
  title = 'a';
}
