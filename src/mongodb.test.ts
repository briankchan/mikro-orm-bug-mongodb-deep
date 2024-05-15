import { Entity, MikroORM, PrimaryKey, Property } from '@mikro-orm/mongodb';

@Entity()
class Dummy {

  @PrimaryKey()
  _id!: number

  @Property({ type: 'jsonb' })
  a!: { b: number }
}

let orm: Awaited<ReturnType<typeof createORM>>

async function createORM() {
  return await MikroORM.init({
    clientUrl: 'mongodb://admin:password@localhost',
    entities: [Dummy],
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
  });
}

beforeAll(async () => {
  orm = await createORM()
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});


test('deep update', async () => {
  const usr1 = orm.em.create(Dummy, { _id: 1, a: { b: 1 } })
  await orm.em.flush()

  orm.em.clear()

  const usr2 = (await orm.em.findOne(Dummy, usr1._id))!
  usr2.a.b = 100
  await orm.em.flush()

  orm.em.clear()

  const usr3 = (await orm.em.findOne(Dummy, usr1._id))!
  expect(usr3.a.b).toBe(100)
});
