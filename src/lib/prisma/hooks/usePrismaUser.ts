import { useState, useEffect, useCallback, useRef } from 'react';
import { type InitData as TelegramInitDataType } from '@telegram-apps/sdk-react';
import { PrismaClient, User } from '@prisma/client'

import { logger } from '../../logger';