/**
 * Team Management Component
 * TUI interface for team collaboration features
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { TeamManager } from '../../team/team-manager.js';
import { Team, TeamMember } from '../../team/types.js';
import { randomUUID } from 'crypto';

interface TeamManagementProps {
  onBack: () => void;
  onError: (error: string) => void;
}

interface TeamListProps {
  teams: Team[];
  selectedIndex: number;
  onTeamSelect: (team: Team) => void;
  onBack: () => void;
}

interface TeamDetailsProps {
  team: Team;
  onBack: () => void;
  onInvite: () => void;
  onCreateVault: () => void;
  onAuditLog: () => void;
}

const TeamList: React.FC<TeamListProps> = ({
  teams,
  selectedIndex,
  onTeamSelect,
  onBack,
}) => {
  useInput((input, key) => {
    if (key.upArrow && selectedIndex > 0) {
      // Navigation will be handled by parent
    } else if (key.downArrow && selectedIndex < teams.length - 1) {
      // Navigation will be handled by parent
    } else if (key.return && teams[selectedIndex]) {
      onTeamSelect(teams[selectedIndex]);
    } else if (input === 'q' || key.escape) {
      onBack();
    }
  });

  if (teams.length === 0) {
    return (
      <Box flexDirection="column" paddingX={2}>
        <Text color="yellow">No teams found</Text>
        <Text color="gray">Press 'q' to go back</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={2}>
      <Text color="blue" bold>
        Your Teams
      </Text>
      <Text color="gray">
        Use ↑/↓ to navigate, Enter to select, 'q' to go back
      </Text>
      <Text></Text>

      {teams.map((team, index) => (
        <Box key={team.id} marginY={0}>
          <Text color={index === selectedIndex ? 'cyan' : 'white'}>
            {index === selectedIndex ? '► ' : '  '}
            {team.name}
          </Text>
          <Text color="gray"> ({team.members.length} members)</Text>
        </Box>
      ))}
    </Box>
  );
};

const TeamDetails: React.FC<TeamDetailsProps> = ({
  team,
  onBack,
  onInvite,
  onCreateVault,
  onAuditLog,
}) => {
  const [selectedAction, setSelectedAction] = useState(0);
  const actions = [
    { label: 'Invite Member', action: onInvite },
    { label: 'Create Vault', action: onCreateVault },
    { label: 'View Audit Log', action: onAuditLog },
    { label: 'Back', action: onBack },
  ];

  useInput((input, key) => {
    if (key.upArrow && selectedAction > 0) {
      setSelectedAction(selectedAction - 1);
    } else if (key.downArrow && selectedAction < actions.length - 1) {
      setSelectedAction(selectedAction + 1);
    } else if (key.return) {
      actions[selectedAction].action();
    } else if (input === 'q' || key.escape) {
      onBack();
    }
  });

  return (
    <Box flexDirection="column" paddingX={2}>
      <Text color="blue" bold>
        {team.name}
      </Text>
      <Text color="gray">ID: {team.id}</Text>
      {team.description && (
        <Text color="gray">Description: {team.description}</Text>
      )}
      <Text></Text>

      <Text color="cyan" bold>
        Members ({team.members.length})
      </Text>
      {team.members.map((member: TeamMember) => (
        <Box key={member.id} marginLeft={2}>
          <Text color={member.status === 'active' ? 'green' : 'gray'}>
            {member.status === 'active' ? '● ' : '○ '}
            {member.email || member.id}
          </Text>
          <Text
            color={
              member.role === 'owner'
                ? 'red'
                : member.role === 'admin'
                  ? 'yellow'
                  : 'white'
            }
          >
            {' '}
            ({member.role})
          </Text>
        </Box>
      ))}
      <Text></Text>

      <Text color="cyan" bold>
        Actions
      </Text>
      <Text color="gray">
        Use ↑/↓ to navigate, Enter to select, 'q' to go back
      </Text>
      {actions.map((action, index) => (
        <Box key={index} marginLeft={2}>
          <Text color={index === selectedAction ? 'cyan' : 'white'}>
            {index === selectedAction ? '► ' : '  '}
            {action.label}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

export const TeamManagement: React.FC<TeamManagementProps> = ({
  onBack,
  onError,
}) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const teamManager = new TeamManager();

  useEffect(() => {
    const loadTeams = async () => {
      try {
        await teamManager.initialize();

        // Mock user ID (in real implementation, this would come from auth)
        const userId = randomUUID();
        const userTeams = await teamManager.getUserTeams(userId);

        setTeams(userTeams);
        setLoading(false);
      } catch (error) {
        onError(
          error instanceof Error ? error.message : 'Failed to load teams'
        );
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  useInput((input, key) => {
    if (!selectedTeam && !loading) {
      if (key.upArrow && selectedTeamIndex > 0) {
        setSelectedTeamIndex(selectedTeamIndex - 1);
      } else if (key.downArrow && selectedTeamIndex < teams.length - 1) {
        setSelectedTeamIndex(selectedTeamIndex + 1);
      }
    }
  });

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleBack = () => {
    if (selectedTeam) {
      setSelectedTeam(null);
    } else {
      onBack();
    }
  };

  const handleInvite = () => {
    // In a real implementation, this would open an invite form
    onError('Invite functionality not yet implemented in TUI');
  };

  const handleCreateVault = () => {
    // In a real implementation, this would open a vault creation form
    onError('Vault creation functionality not yet implemented in TUI');
  };

  const handleAuditLog = () => {
    // In a real implementation, this would show the audit log
    onError('Audit log functionality not yet implemented in TUI');
  };

  if (loading) {
    return (
      <Box flexDirection="column" paddingX={2}>
        <Text color="yellow">Loading teams...</Text>
      </Box>
    );
  }

  if (selectedTeam) {
    return (
      <TeamDetails
        team={selectedTeam}
        onBack={handleBack}
        onInvite={handleInvite}
        onCreateVault={handleCreateVault}
        onAuditLog={handleAuditLog}
      />
    );
  }

  return (
    <TeamList
      teams={teams}
      selectedIndex={selectedTeamIndex}
      onTeamSelect={handleTeamSelect}
      onBack={handleBack}
    />
  );
};
