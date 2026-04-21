import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddRegisteredUserIdToGamePlayers1779300000000 implements MigrationInterface {
  name = 'AddRegisteredUserIdToGamePlayers1779300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the new column
    await queryRunner.addColumn(
      'game_players',
      new TableColumn({
        name: 'registered_user_id',
        type: 'int',
        isNullable: true, // optional, only for registered users
      }),
    );

    // Add foreign key constraint to users table
    await queryRunner.createForeignKey(
      'game_players',
      new TableForeignKey({
        columnNames: ['registered_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the FK
    const table = await queryRunner.getTable('game_players');
    const fk = table!.foreignKeys.find(fk => fk.columnNames.includes('registered_user_id'));
    if (fk) {
      await queryRunner.dropForeignKey('game_players', fk);
    }

    // Drop the column
    await queryRunner.dropColumn('game_players', 'registered_user_id');
  }
}