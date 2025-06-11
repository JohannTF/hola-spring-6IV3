package escom.ipn.hola_spring_6IV3.dto;

public class AddFavoriteRequest {
    
    private String bookId;
    private String bookTitle;
    private String bookCoverId;
    
    // Constructor por defecto
    public AddFavoriteRequest() {}
    
    // Constructor con parámetros
    public AddFavoriteRequest(String bookId, String bookTitle, String bookCoverId) {
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.bookCoverId = bookCoverId;
    }
    
    // Getters y Setters
    public String getBookId() {
        return bookId;
    }
    
    public void setBookId(String bookId) {
        this.bookId = bookId;
    }
    
    public String getBookTitle() {
        return bookTitle;
    }
    
    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }
    
    public String getBookCoverId() {
        return bookCoverId;
    }
    
    public void setBookCoverId(String bookCoverId) {
        this.bookCoverId = bookCoverId;
    }
}
