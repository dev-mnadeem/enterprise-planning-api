export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(); // Get current timestamp
  const randomNum = Math.floor(Math.random() * 1000000).toString(); // Generate a random number between 0 and 999999
  const orderNumber = timestamp + randomNum; // Concatenate the timestamp and random number

  return orderNumber;
}
