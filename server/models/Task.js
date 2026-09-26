/**
 * Task Model & Mongoose Schema representation
 */

export const taskSchemaDefinition = {
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  tags: [{ type: String }],
  assignedTo: { type: String, default: '' },
  createdBy: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true }
  }
};
