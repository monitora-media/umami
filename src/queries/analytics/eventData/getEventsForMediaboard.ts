import prisma from 'lib/prisma';
import { PRISMA, runQuery } from 'lib/db';
import { MediaboardEventData } from 'lib/types';

export async function getEventsForMediaboard(
  startDate: Date,
  endDate: Date,
): Promise<MediaboardEventData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(startDate.toISOString(), endDate.toISOString()),
    // [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(startDate: string, endDate: string) {
  const { rawQuery } = prisma;
  const sql = `
        SELECT
            we.created_at,
            we.website_id,
            we.session_id,
            we.event_id AS website_event_id,
            we.url_path,
            we.event_type,
            we.event_name,
            MAX(CASE ed.data_key WHEN 'trid' THEN ed.string_value ELSE NULL END) AS trid,
            MAX(CASE ed.data_key WHEN 'target' THEN ed.string_value ELSE NULL END) AS target
        FROM
            public.website_event AS we
        JOIN public.event_data AS ed
        ON
            we.website_id = ed.website_id
            AND we.event_id = ed.website_event_id
        WHERE
            we.created_at BETWEEN '${startDate}' AND '${endDate}'
        GROUP BY
            we.created_at,
            we.website_id,
            we.session_id,
            we.event_id,
            we.event_type,
            we.event_name
        ORDER BY
            we.created_at
            `;
  // console.log(`sql: ${sql}`);
  return rawQuery(sql, {}).then(a => {
    return Object.values(a).map(a => {
      return {
        createdAt: new Date(a.created_at),
        websiteId: a.website_id,
        sessionId: a.session_id,
        websiteEventId: a.website_event_id,
        urlPath: a.url_path,
        eventType: Number(a.event_type),
        eventName: a.event_name,
        trid: a.trid,
        target: a.target,
      };
    });
  });
}
