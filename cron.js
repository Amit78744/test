const env = require('./constants');



var test_cron = function() {
    try {
      trial_cron = env.cron.schedule('* * * * *', () => {
  
        console.log('Running a job at 12:00 AM everyday');

        return "amit"
  
      });
    } catch (error) {
      console.log(error);
    }
}

test_cron();