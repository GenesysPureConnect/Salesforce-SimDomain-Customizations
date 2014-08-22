public with sharing class MyInteractionsController {
    String m_filter = 'CreatedDate = TODAY';

    public List<Task> getMyTasks(){
       String query = 'SELECT Id, WhatId, What.Type, WhoId, Who.Type, Subject, Type, CreatedDate, OwnerId FROM Task WHERE ' + m_filter  + ' AND OwnerId = \'' + UserInfo.getUserId() +'\' Order By CreatedDate desc LIMIT 15';
       List<Task> tasks = Database.query(query);
       return tasks;
    }

    public List<SelectOption> getItems() {
        List<SelectOption> options = new List<SelectOption>();
        options.add(new SelectOption('CreatedDate = TODAY','Today'));
        options.add(new SelectOption('CreatedDate = YESTERDAY','Yesterday'));
        options.add(new SelectOption('CreatedDate = THIS_WEEK','Current Week'));
        options.add(new SelectOption('CreatedDate = LAST_WEEK','Last Week'));
        return options;
    }
    
    public String getFilter() {
        return m_filter ;
    }
        
    public void setFilter(String filter) {
       this.m_filter= filter ;
    }  
}