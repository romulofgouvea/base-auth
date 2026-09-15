import {
  EventSubscriber,
  EntitySubscriberInterface,
  BeforeQueryEvent,
} from 'typeorm';
import { HHBaseEntity } from '../entities/hh-base.entity';

/**
 * Second line of defense for isActive = true filtering.
 *
 * NOTE: TypeORM 0.3.x's `BeforeQueryEvent` API only exposes the compiled SQL
 * string and parameters, so it is not possible to inject WHERE clauses here.
 * The primary filter is applied by `BaseRepository.createActiveQueryBuilder`.
 *
 * This subscriber is kept as an extension point / future audit-logging hook
 * in case TypeORM exposes builder access later.
 */
@EventSubscriber()
export class ActiveFilterSubscriber implements EntitySubscriberInterface {
  beforeQuery(_event: BeforeQueryEvent<any>): void {
    const entityClass = HHBaseEntity;
    void entityClass;
  }
}
