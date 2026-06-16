import { describe, it, expect } from 'vitest';
// Instead of importing the mongoose models which might attempt to connect if setup is wrong, 
// we will rely on the mocked mongoose from setup.ts to verify schemas.
import { User, Project, VentureState } from '@creator/database';

describe('Database Models', () => {
  it('should define User model', () => {
    expect(User).toBeDefined();
    expect(User.modelName).toBe('User');
  });

  it('should define Project model', () => {
    expect(Project).toBeDefined();
    expect(Project.modelName).toBe('Project');
  });

  it('should define VentureState model', () => {
    expect(VentureState).toBeDefined();
    expect(VentureState.modelName).toBe('VentureState');
  });
});
