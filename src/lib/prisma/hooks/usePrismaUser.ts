import { useState, useEffect, useCallback, useRef } from 'react';
import { type InitData as TelegramInitDataType } from '@telegram-apps/sdk-react';
import { prisma } from '../client';

