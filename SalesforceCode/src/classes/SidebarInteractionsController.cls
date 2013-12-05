global with sharing class SidebarInteractionsController {
	public SidebarInteractionsController() { }
        
    @RemoteAction
    global static String getTasks(String objectId) {
                
        List<SObject> sObjects = new List<SObject>();
        if(objectId != null && !objectId.equals('') && !objectId.equals('null')) {
            Id objId = Id.valueOf(objectId);
            
            String query = 'SELECT Subject, Type, Id, CreatedDate FROM Task where whatId = \''+objectId+'\'';
            System.debug('~~ query ['+query+']');     
               
            try {        
                sObjects = Database.query(query);
            } catch (QueryException qe) {
          	    System.debug('~~ query ['+qe.getMessage()+']');
	        }
        } 
        return JSON.serialize(sObjects);        
    }   
    
    @RemoteAction
    global static String getCaseSummary(String objectId) {
                
        if(objectId != null && !objectId.equals('') && !objectId.equals('null')) {
            CaseSummary summary = new CaseSummary(objectId);
            return JSON.serialize(summary);
        } 
        return '';        
    }   
    
    class CaseSummary{
    	private String m_priority; //Medium, High, Log
    	private String m_origin; //Email, Phone, Web
    	private Integer m_caseAge;
    	private Integer m_caseActivityCount;
    	private Boolean m_isClosed;
    	
    	public String Priority	{get {return m_priority;}}
    	public String Origin	{get {return m_origin;}}
    	public Integer CaseAge	{get {return m_caseAge;}}
    	public Integer ActivityCount	{get {return m_caseActivityCount;}}
    	public Boolean IsClosed	{get {return m_isClosed;}}
    	
    	public CaseSummary(String caseId){
    		Case c = [select CreatedDate, Id, IsClosed, Origin, Priority, SystemModstamp from case where id =:caseId limit 1];
    		
    		if(c.Priority != null){
    			m_priority = c.Priority;	
    		}
    		else{
    			m_priority = 'Medium';
    		}
    		
    		if(c.Origin != null){
    			m_origin  = c.Origin;
    		}
    		else{
    			m_origin = 'Unknown';
    		}
    		m_isClosed = c.IsClosed;
    		m_caseAge = Date.newinstance(c.CreatedDate.year(), c.CreatedDate.month(), c.CreatedDate.day()).daysBetween(Date.today());
    		m_caseActivityCount = [select count() from Task where whatId =:caseId ];
    	}	
    }
}