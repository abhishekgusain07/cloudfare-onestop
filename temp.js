const { Rettiwt } = require("rettiwt-api");

// Initialize with minimal configuration

async function getTweetDetails(tweetId) {
  const rettiwt = new Rettiwt({ apiKey: "a2R0PWdVcU5paTBWN3hLTEp5V3FtYmdHSVU2enJXVWdBME1VaEhoZVdtWFI7YXV0aF90b2tlbj0yZjI0NGM2NTcwNzMyYWRjNjlkMWFhZDVhZTFjNTMxYmIwODJiZGI5O2N0MD1jNzE1ZTAxNGJhMjAxMzg1NTFjNzM1NzM1YTU1Njc2ODIzYTg4NTkyZDM0ZWU3NTRlY2YyMmM2OThlZmQ3ZjAwOGZjODllZDk0OThmNmNjMWFiYWNkYjZjMjg3ZDYwOThhYjhlZTc1ZTEzOWMzODU2MWJkYmJkMGU5YmNmOWQyMmFiN2EzYWFhNjRhYjcyOTZmZmU2YTJiMDE2YjMxMjVmO3R3aWQ9dSUzRDE1Mzc4NzU2MjA0MzIzNDMwNDA7" });

  try {
    console.log("Attempting to fetch tweet with ID:", tweetId);
    
    // First try to get basic tweet info
    rettiwt.tweet.details("1917583029259886732").then(res => {
      console.log(res);
    }).catch(err => {
      console.log(err);
    });
    
  } catch (error) {
    console.error('Error fetching tweet:', error);
    if (error.status === 404) {
      console.error("Tweet not found. This could mean:");
      console.error("1. The tweet has been deleted");
      console.error("2. The tweet is private");
      console.error("3. The tweet ID is incorrect");
      console.error("4. The API key might be invalid or expired");
    } else {
      console.error("Error details:", error);
    }
    throw error;
  }
}

const main = async () => {
  try {
    // Using a known public tweet ID
    const tweet = await getTweetDetails("1827230673712578560");
    console.log("Tweet data:", tweet);
  } catch (error) {
    console.error("Failed to fetch tweet:", error.message);
  }
}

main();