import { Component } from '@angular/core';
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-spotify-login-component',
  standalone: true,
    imports: [
        RouterLink
    ],
  template: `
    <p>
      spotify-login-component works!
    </p>
    <div class="px-0 py-4"><a href="http://localhost:5200/login" class="bg-green-500 rounded px-10 py-4">Login with Spotify</a></div>
  `,
  styles: ``
})
export class SpotifyLoginComponentComponent {
}
