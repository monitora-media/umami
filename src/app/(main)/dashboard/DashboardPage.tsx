'use client';
import DashboardEdit from 'app/(main)/dashboard/DashboardEdit';
import DashboardSettingsButton from 'app/(main)/dashboard/DashboardSettingsButton';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import LinkButton from 'components/common/LinkButton';
import Pager from 'components/common/Pager';
import {
  useLocale,
  useLogin,
  useMessages,
  useNavigation,
  useTeams,
  useTeamUrl,
  useWebsites,
} from 'components/hooks';
import Icons from 'components/icons';
import PageHeader from 'components/layout/PageHeader';
import { Button, Flexbox, Icon, Loading, Text } from 'react-basics';
import useDashboard from 'store/dashboard';
import WebsiteChartList from '../websites/[websiteId]/WebsiteChartList';

export function DashboardPage() {
  const { formatMessage, labels, messages } = useMessages();
  const { teamId, renderTeamUrl } = useTeamUrl();
  const { showCharts, editing } = useDashboard();
  const { router } = useNavigation();
  const { user } = useLogin();
  const { result: teams } = useTeams(user?.id);
  const { dir } = useLocale();
  const pageSize = 10;
  const cloudMode = !!process.env.cloudMode;

  const { result, query, params, setParams } = useWebsites({ teamId }, { pageSize });
  const { page } = params;
  const hasData = !!result?.data?.length;

  const handlePageChange = (page: number) => {
    setParams({ ...params, page });
  };

  const switchTeam = (teamId: string) => {
    const url = teamId ? `/teams/${teamId}` : '/';
    router.push(cloudMode ? `${process.env.cloudUrl}${url}` : url);
  };

  if (query.isLoading) {
    return <Loading />;
  }

  return (
    <section style={{ marginBottom: 60 }}>
      <PageHeader title={formatMessage(labels.dashboard)}>
        {!editing && hasData && <DashboardSettingsButton />}
      </PageHeader>
      {!hasData && (
        <EmptyPlaceholder message={formatMessage(messages.noWebsitesConfigured)}>
          <Flexbox gap={20} direction="column" alignContent="center">
            <LinkButton href={renderTeamUrl('/settings/websites')}>
              <Icon rotate={dir === 'rtl' ? 180 : 0}>
                <Icons.ArrowRight />
              </Icon>
              <Text>{formatMessage(messages.goToSettings)}</Text>
            </LinkButton>
            {!teamId && teams.count > 0 ? (
              <>
                <Text size="md">See websites for your teams:</Text>
                <Flexbox gap={30} justifyContent="center">
                  {teams.count > 0 &&
                    teams.data.map(team => (
                      <Button key={team.id} onClick={() => switchTeam(team.id)}>
                        <Icon>
                          <Icons.Users></Icons.Users>
                        </Icon>
                        {team.name}
                      </Button>
                    ))}
                </Flexbox>
              </>
            ) : teamId && (
              <Button onClick={() => switchTeam('')}>
                <Icon>
                  <Icons.User></Icons.User>
                </Icon>
                Your websites
              </Button>
            )}
          </Flexbox>
        </EmptyPlaceholder>
      )}
      {hasData && (
        <>
          {editing && <DashboardEdit teamId={teamId} />}
          {!editing && (
            <>
              <WebsiteChartList
                websites={result?.data as any}
                showCharts={showCharts}
                limit={pageSize}
              />
              <Pager
                page={page}
                pageSize={pageSize}
                count={result?.count}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}

export default DashboardPage;
