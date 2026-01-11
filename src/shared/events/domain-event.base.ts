import { v7 as uuidv7 } from 'uuid';

export abstract class DomainEvent {
  public readonly aggregateId: string;
  public readonly eventId: string;
  public readonly occurredOn: Date;

  constructor(props: { aggregateId: string }) {
    this.aggregateId = props.aggregateId;
    this.eventId = uuidv7(); // Tự động sinh ID duy nhất
    this.occurredOn = new Date(); // Tự động lấy giờ hiện tại
  }
}
