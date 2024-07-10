import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok } from 'next-basics';
import { getEventsForMonitora } from 'queries';
import * as yup from 'yup';

export interface EventsForMonitoraRequestQuery {
  startAt: string;
  endAt: string;
}

const schema = {
  GET: yup.object().shape({
    startAt: yup.number().integer().required(),
    endAt: yup.number().integer().moreThan(yup.ref('startAt')).required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<EventsForMonitoraRequestQuery, any>,
  res: NextApiResponse<any>,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'GET') {
    const { startAt, endAt } = req.query;

    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    const data = await getEventsForMonitora(startDate, endDate);

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
