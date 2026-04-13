import { Component } from '@angular/core';
import { HeaderCampaigns } from "@feactures/campaigns/components/header-campaigns/header-campaigns";
import { TableCampaigns } from "@feactures/campaigns/components/table-campaigns/table-campaigns";

@Component({
  selector: 'app-campaigns-home',
  imports: [HeaderCampaigns, TableCampaigns],
  templateUrl: './campaigns-home.html',
})
export class CampaignsHome { }
