const db = require('../db');

/**
 * Controller for Jan Setu Government Field Team Tasks
 */

/**
 * Ward in-charge assigns an approved complaint / request to a specialized field team
 * POST /api/ward/assign-team or POST /api/team/assign
 */
async function assignTeamHandler(req, res) {
  try {
    const {
      requestId,
      request_id,
      teamId,
      team_id,
      teamName,
      team_name,
      category,
      department,
      notes,
      ward,
      district,
      state,
      priority
    } = req.body;

    const targetRequestId = requestId || request_id;
    const targetTeamId = teamId || team_id;
    const targetTeamName = teamName || team_name;

    if (!targetRequestId) {
      return res.status(400).json({
        success: false,
        error: 'Target complaint / request ID is required for team assignment.'
      });
    }

    if (!targetTeamId || !targetTeamName) {
      return res.status(400).json({
        success: false,
        error: 'Field team ID and team name are required.'
      });
    }

    const existingReq = await db.getRequestById(targetRequestId);
    if (!existingReq) {
      return res.status(404).json({
        success: false,
        error: `Complaint / Request not found: ${targetRequestId}`
      });
    }

    const reqType = (existingReq.request_type || 'demand').toLowerCase().trim();
    if (reqType !== 'complaint') {
      return res.status(400).json({
        success: false,
        error: 'Team assignment is only available for complaints. Demands cannot be assigned to field teams.'
      });
    }

    const assignedBy = req.govUser?.name || 'Ward In-charge';
    const assignedByEmail = req.govUser?.email || null;

    const task = await db.assignRequestToTeam({
      requestId: targetRequestId,
      teamId: targetTeamId,
      teamName: targetTeamName,
      category,
      department,
      assignedBy,
      assignedByEmail,
      notes,
      ward: ward || req.govUser?.monitoring_ward || null,
      district: district || req.govUser?.monitoring_district || null,
      state: state || req.govUser?.monitoring_state || 'Maharashtra',
      priority
    });

    return res.status(200).json({
      success: true,
      message: `Task successfully assigned to ${targetTeamName}.`,
      data: task
    });
  } catch (err) {
    console.error('Error assigning task to team:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to assign task to field team.'
    });
  }
}

/**
 * Field team retrieves their assigned tasks (with filters: status, search, category)
 * GET /api/team/tasks
 */
async function getTeamTasksHandler(req, res) {
  try {
    const { teamId, team_id, category, status, search } = req.query;
    
    // Auto-detect team ID, code, email, name, and category from authenticated user or query
    const effTeamId = teamId || team_id || req.govUser?.team_code || req.govUser?.email || null;
    const effTeamCode = req.govUser?.team_code || null;
    const effUserEmail = req.govUser?.email || null;
    const effTeamName = req.govUser?.name || null;
    const effCategory = category || (req.govUser?.role === 'field_team' ? req.govUser?.category : null);

    const tasks = await db.getTeamTasks({
      teamId: effTeamId,
      teamCode: effTeamCode,
      userEmail: effUserEmail,
      teamName: effTeamName,
      category: effCategory,
      status,
      search
    });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    console.error('Error fetching team tasks:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve field team tasks.'
    });
  }
}

/**
 * Get full task details by ID or task_code
 * GET /api/team/tasks/:id
 */
async function getTaskByIdHandler(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required.'
      });
    }

    const task = await db.getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    console.error('Error fetching task details:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve task details.'
    });
  }
}

/**
 * Field team starts working on an assigned task (Status: Assigned -> In Progress)
 * POST /api/team/tasks/:id/start
 */
async function startTaskHandler(req, res) {
  try {
    const { id } = req.params;
    const { notes, beforePhoto, before_photo_url } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required to start task.'
      });
    }

    const targetBeforePhoto = beforePhoto || before_photo_url;
    if (!targetBeforePhoto || !String(targetBeforePhoto).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Before photo is required to start this task.'
      });
    }

    const updatedTask = await db.startTeamTask({
      taskId: id,
      notes: notes || 'Work started on-site by field team.',
      beforePhoto: targetBeforePhoto
    });

    return res.status(200).json({
      success: true,
      message: 'Task is now In Progress. Status synchronized with Ward administration.',
      data: updatedTask
    });
  } catch (err) {
    console.error('Error starting team task:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to update task to In Progress.'
    });
  }
}

/**
 * Field team completes a task with required after photo and optional completion note
 * POST /api/team/tasks/:id/complete
 */
async function completeTaskHandler(req, res) {
  try {
    const { id } = req.params;
    const { notes, completionNotes, completion_notes, afterPhoto, after_photo_url } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required to complete task.'
      });
    }

    const targetAfterPhoto = afterPhoto || after_photo_url;
    if (!targetAfterPhoto || !String(targetAfterPhoto).trim()) {
      return res.status(400).json({
        success: false,
        error: 'After photo is required to complete this task.'
      });
    }

    const finalNotes = completionNotes || completion_notes || notes || 'Work completed by assigned field team.';

    const updatedTask = await db.completeTeamTask({
      taskId: id,
      completionNotes: finalNotes,
      afterPhoto: targetAfterPhoto
    });

    return res.status(200).json({
      success: true,
      message: 'Task successfully completed. Completion report dispatched to Ward In-charge and Citizen.',
      data: updatedTask
    });
  } catch (err) {
    console.error('Error completing team task:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to complete task.'
    });
  }
}

module.exports = {
  assignTeamHandler,
  getTeamTasksHandler,
  getTaskByIdHandler,
  startTaskHandler,
  completeTaskHandler
};
