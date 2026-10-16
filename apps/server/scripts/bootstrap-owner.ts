import { database } from "#shared/database/prisma";
import { usersService } from "#modules/core/users/users.service";
import { env } from "#shared/config/env";
import { logger } from "#shared/logger";

async function bootstrapOwner() {
  const email = env.OWNER_EMAIL;
  const firstName = env.OWNER_FIRST_NAME;
  const lastName = env.OWNER_LAST_NAME;
  const phone = env.OWNER_PHONE;

  await usersService.createOwnerInvite({ email, firstName, lastName, phone });
  logger.info(`Owner invite sent to ${email}`);
}

bootstrapOwner()
  .catch((err) => {
    logger.error({ errorr: err }, "bootstrap error");
    process.exit(1);
  })
  .finally(() => database.$disconnect());
