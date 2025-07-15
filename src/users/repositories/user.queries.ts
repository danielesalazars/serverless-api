export const UserQueries = {
  getAll: `SELECT * FROM [dbo].[user];`,
  getById: `SELECT * FROM [dbo].[user] WHERE id = @param1;`,
  getByEmail: `SELECT * FROM [dbo].[user] WHERE email = @param1;`,
  create: `
    INSERT INTO [dbo].[user] (first_name, last_name, email, password_hash, role, is_active)
    OUTPUT inserted.*
    VALUES (@param1, @param2, @param3, @param4, @param5, @param6);`,
  update: `
    UPDATE [dbo].[user]
    SET first_name = @param1, last_name = @param2, email = @param3, updated_at = SYSDATETIME()
    OUTPUT inserted.*
    WHERE id = @param4;`,
  delete: `DELETE FROM [dbo].[user] WHERE id = @param1;`,
};
