// src/services/stand.service.js
import api from '../utils/api';

class StandService {
  // Get all stands with optional filters
  async getStands(type = '', status = '', search = '') {
    try {
      let url = '/stands';
      const params = [];
      
      if (type) params.push(`type=${encodeURIComponent(type)}`);
      if (status) params.push(`status=${encodeURIComponent(status)}`);
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching stands');
      return [];
    }
  }

  // Get stands for a specific plan
  async getStandsByPlan(planId) {
    try {
      const response = await api.get(`/stands/plan/${planId}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching stands for plan');
      return [];
    }
  }

  // Get stands for a specific event
  async getStandsByEvent(eventId) {
    try {
      const response = await api.get(`/stands/event/${eventId}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching stands for event');
      return [];
    }
  }

  // Get available stands for a specific event
  async getAvailableStandsByEvent(eventId) {
    try {
      const response = await api.get(`/stands/available/event/${eventId}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error fetching available stands for event');
      return [];
    }
  }

  // Get stand by ID
  async getStandById(id) {
    try {
      const response = await api.get(`/stands/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error fetching stand ${id}`);
      return null;
    }
  }

  // Create new stand
  async createStand(standData) {
    try {
      const response = await api.post('/stands', standData);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Error creating stand');
      throw error;
    }
  }

  // Update stand
  async updateStand(id, standData) {
    try {
      const response = await api.patch(`/stands/${id}`, standData);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error updating stand ${id}`);
      throw error;
    }
  }

  /**
 * Reserve a stand for a registration
 */
async reserveStand(id, registrationId) {
  this.logger.log(`Reserving stand ${id} for registration ${registrationId}`);
  
  // Get the stand
  const stand = await this.findOne(id);
  
  // Check if stand is available or already reserved for this registration
  // This is the important change - we allow the stand to be reserved again if it's for the same registration
  const isReservedByThisRegistration = stand.reservation && 
    String(stand.reservation) === String(registrationId);
    
  if (stand.status !== 'available' && !isReservedByThisRegistration) {
    throw new BadRequestException(`Stand with ID ${id} is not available`);
  }
  
  // Only update if the stand isn't already reserved for this registration
  if (!isReservedByThisRegistration) {
    // Update the stand status
    const updatedStand = await this.standModel.findByIdAndUpdate(
      id,
      { 
        status: 'reserved',
        reservation: new Types.ObjectId(registrationId)
      },
      { new: true }
    )
    .populate('plan')
    .exec();
    
    if (!updatedStand) {
      throw new NotFoundException(`Stand with ID ${id} not found`);
    }
    
    return updatedStand;
  }
  
  // If it's already reserved for this registration, just return the stand
  return stand;
}
  // Update stand status
  async updateStandStatus(id, status, reason = '') {
    try {
      const response = await api.patch(`/stands/${id}/status`, { status, reason });
      return response.data;
    } catch (error) {
      this._handleError(error, `Error updating stand status ${id}`);
      throw error;
    }
  }

  // Delete stand
  async deleteStand(id) {
    try {
      const response = await api.delete(`/stands/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error, `Error deleting stand ${id}`);
      throw error;
    }
  }

  // Handle errors consistently
  _handleError(error, defaultMessage) {
    console.error(`${defaultMessage}:`, error);
    
    let errorMessage = defaultMessage;
    
    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = "You don't have the necessary permissions to perform this action";
      } else if (error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          if (Array.isArray(error.response.data.message)) {
            errorMessage = error.response.data.message.join(', ');
          } else {
            errorMessage = error.response.data.message;
          }
        }
      }
    }
    
    throw new Error(errorMessage);
  }
}

const standService = new StandService();
export default standService;