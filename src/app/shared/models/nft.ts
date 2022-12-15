enum NFTStatus {
    PAUSED,
    LISTED,
    BORROWED
}


export interface INFT {
    id:number;
    start: number,
    duration:number,
    cost:number,
    status:NFTStatus,
    borrower:string,
    owner:string;
    name:string
    returnTaskId:string
 
}