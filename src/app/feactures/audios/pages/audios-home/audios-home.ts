import { Component } from '@angular/core';
import { HeaderAudios } from "@feactures/audios/components/header-audios/header-audios";
import { TableAudios } from "@feactures/audios/components/table-audios/table-audios";

@Component({
  selector: 'app-audios-home',
  imports: [HeaderAudios, TableAudios],
  templateUrl: './audios-home.html',
})
export class AudiosHome { }
