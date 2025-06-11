package escom.ipn.hola_spring_6IV3.domain.dto;

import java.time.LocalDateTime;

public class FavoriteDTO {
    
    private Long id;
    private String bookId;
    private String bookTitle;
    private String bookCoverId;
    private LocalDateTime addedDate;
    
    // Constructor por defecto
    public FavoriteDTO() {}
    
    // Constructor con parámetros
    public FavoriteDTO(Long id, String bookId, String bookTitle, String bookCoverId, LocalDateTime addedDate) {
        this.id = id;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.bookCoverId = bookCoverId;
        this.addedDate = addedDate;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public LocalDateTime getAddedDate() {
        return addedDate;
    }
    
    public void setAddedDate(LocalDateTime addedDate) {
        this.addedDate = addedDate;
    }
}
