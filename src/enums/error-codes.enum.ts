export enum StatusCode {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    INTERNAL_SERVER_ERROR = 500,
    NOT_FOUND = 404
  }
  
  export enum ErrorMessage {
    BAD_REQUEST = 'bad request',
    INTERNAL_SERVER_ERROR = 'n error occurred while processing the request.',
    RETRIEVING_DATA_ERROR = 'an error occurred while retrieving the data.',
    CONTACT_NOT_FOUND = 'contact not found'    
  }
  