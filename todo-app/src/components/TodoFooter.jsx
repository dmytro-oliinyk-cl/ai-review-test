/**
 * TodoFooter component - displays todo statistics
 * Following CQ-4.01: Single responsibility per component
 */

function TodoFooter({ remainingCount, totalCount }) {
  return (
    <div className="footer">
      <p>
        {remainingCount} of {totalCount} tasks remaining
      </p>
    </div>
  );
}

export default TodoFooter;
