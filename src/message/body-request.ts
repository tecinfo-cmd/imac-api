import { ResourceRequest } from './resource-request';

export class BodyRequest {
  id:string = "%commandId";
  to:string = "postmaster@activecampaign.msging.net";
  method:string = "set"
  uri:string =  "/campaign/full";
  type:string = "application/vnd.iris.activecampaign.full-campaign+json";
  resource: ResourceRequest;
}
