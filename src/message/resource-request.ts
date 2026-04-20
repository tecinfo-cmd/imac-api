import { MessageRequest } from './message-request';
import { AudiencesRequest } from './audiences-request';
import { CampaignRequest } from './campaign-request';

export class ResourceRequest {

  campaign:  CampaignRequest;
  audience: AudiencesRequest
  message: MessageRequest

}
