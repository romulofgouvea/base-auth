import {
  Repository,
  DataSource,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  SelectQueryBuilder,
  RemoveOptions,
  SaveOptions,
} from 'typeorm';
import { HHBaseEntity } from '../entities/hh-base.entity';

export class BaseRepository<T extends HHBaseEntity> extends Repository<T> {
  constructor(
    private readonly entityTarget: EntityTarget<T>,
    dataSource: DataSource,
  ) {
    super(entityTarget, dataSource.createEntityManager());
  }

  override find(_options?: FindManyOptions<T>): Promise<T[]> {
    return this.createActiveQueryBuilder('e').getMany();
  }

  override findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.createActiveQueryBuilder('e')
      .andWhere(options.where ? options.where : '1=1')
      .getOne();
  }

  override findAndCount(_options?: FindManyOptions<T>): Promise<[T[], number]> {
    return this.createActiveQueryBuilder('e').getManyAndCount();
  }

  override remove(entities: T[], options?: RemoveOptions): Promise<T[]>;
  override remove(entity: T, options?: RemoveOptions): Promise<T>;
  override remove(
    entityOrEntities: T | T[],
    options?: RemoveOptions,
  ): Promise<T | T[]> {
    if (Array.isArray(entityOrEntities)) {
      entityOrEntities.forEach((entity) => entity.disable());
      return this.save(entityOrEntities, options as SaveOptions);
    }
    entityOrEntities.disable();
    return this.save(entityOrEntities, options as SaveOptions);
  }

  findAllIncludingInactive(options?: FindManyOptions<T>): Promise<T[]> {
    return super.find(options);
  }

  findOneIncludingInactive(options: FindOneOptions<T>): Promise<T | null> {
    return super.findOne(options);
  }

  createActiveQueryBuilder(alias: string): SelectQueryBuilder<T> {
    return this.createQueryBuilder(alias).where(
      `${alias}.isActive = :isActive`,
      {
        isActive: true,
      },
    );
  }
}
